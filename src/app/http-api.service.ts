import {
  Injectable,
  Provider,
  SkipSelf,
  Optional,
  Inject
} from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
  HttpParams,
  HttpHandler,
  HttpBackend,
  HttpRequest
} from '@angular/common/http';
import { Observable, from, throwError, empty, fromEvent, of } from 'rxjs';
import { map, catchError, flatMap } from 'rxjs/operators';

// 后端返回的标准json数据格式
export interface HttpApiResponseData {
  code: string;
  data?: any; // 出错时此值可能不存在
  detail: string;
  errorCode: string;
  errorDesc: string;
  exStack: string;
  resultMsg: string;
  success: boolean;
}

export class HttpApiError extends Error {
  public originalResponseData: HttpApiResponseData;

  constructor(message?: string, originalResponseData?: HttpApiResponseData) {
    super(message);
    this.originalResponseData = originalResponseData;
  }
}

export interface CommonRequstOptions {
  headers?:
    | HttpHeaders
    | {
        [header: string]: string | string[];
      };
  // observe?: 'body';
  params?:
    | HttpParams
    | {
        [param: string]: any;
      };
  // reportProgress?: boolean;
  responseType?: string | any;
  // withCredentials?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class HttpAPIService {
  private csrfToken = 'd';
  // 请求周期性钩子
  private hookMap = {
    // 供用户挂载的自定义错误处理函数，格式 (error: HttpApiError) => any
    // 返回 ErrorObservable：会以返回的该错误进行抛出
    // 返回 false：表示终止错误抛出，此步骤后，不再抛出错误
    // 返回 空或其他值：表示按默认的流程，继续抛出原错误
    errorHandler: null
  };

  constructor(private _http: HttpClient) {}

  // -------------------------------------------------------------------------
  // | Overrides
  // -------------------------------------------------------------------------

  // 覆盖式注册钩子
  registerHook(name: string, fn: Function) {
    if (!this.hookMap.hasOwnProperty(name)) {
      throw new Error(`Hook "${name}" not support.`);
    }
    if (this.hookMap[name]) {
    }
    this.hookMap[name] = fn;
  }

  // request(url: string | Request, options: RequestOptionsArgs): Observable<any> {
  //   options = this._defaultRequestOptions(url, options);
  //   return super.request(url, options)
  //               .map(this._extractResponse.bind(this))
  //               .catch(this._handleError.bind(this));
  // }

  get(url: string, options?: CommonRequstOptions): Observable<any> {
    return this._beforeRequest(options).pipe(
      flatMap(formatOptions => {
        return this._http
          .get('http://daily.yunbi.biz.aliyun.test' + url, formatOptions)
          .pipe(
            map(this._extractResponse.bind(this)),
            catchError(this._handleError.bind(this))
          );
      })
    );
  }

  post(
    url: string,
    body?: any,
    options?: CommonRequstOptions
  ): Observable<any> {
    return this._beforeRequest(options).pipe(
      flatMap(formatOptions => {
        return this._http.post(url, body, formatOptions).pipe(
          map(this._extractResponse.bind(this)),
          catchError(this._handleError.bind(this))
        );
      })
    );
  }

  put(url: string, body?: any, options?: CommonRequstOptions): Observable<any> {
    return this._beforeRequest(options).pipe(
      flatMap(formatOptions => {
        return this._http.put(url, body, formatOptions).pipe(
          map(this._extractResponse.bind(this)),
          catchError(this._handleError.bind(this))
        );
      })
    );
  }

  delete(url: string, options?: CommonRequstOptions): Observable<any> {
    return this._beforeRequest(options).pipe(
      flatMap(formatOptions => {
        return this._http.delete(url, formatOptions).pipe(
          map(this._extractResponse.bind(this)),
          catchError(this._handleError.bind(this))
        );
      })
    );
  }

  // -------------------------------------------------------------------------
  // | Internal methods
  // -------------------------------------------------------------------------

  // Do some work before request and return the new options
  private _beforeRequest(options?: CommonRequstOptions) {
    // Get csrf token at the first time
    return from(this.csrfToken ? [this.csrfToken] : this._loadCsrfToken()).pipe(
      map((token: string) => {
        // Return default formatted options
        return this._formatRequestOptions(options);
      })
    );
  }

  private _formatRequestOptions(options?: CommonRequstOptions) {
    // options = options || new RequestOptions();
    options = options || {};
    if (!options.headers) {
      options.headers = {};
    }
    // Setting default headers
    // headers.set('Content-Type', 'application/json');
    options.headers['X-Requested-With'] = 'XMLHttpRequest';
    options.headers['X-Csrf-Token'] = this.csrfToken;
    // options.headers.set('X-Custom-Qbi-Locale', this.locaz.getLocale());

    return options;
  }

  private _extractResponse(result: HttpApiResponseData) {
    if (result && typeof result === 'object') {
      // 标准的json接口
      if (result.success) {
        return result.data;
      } else {
        throw new HttpApiError(result.errorDesc || '', result);
      }
    }
    // 其他数据，直接返回
    return result;
  }

  private _handleError(error: HttpErrorResponse) {
    let returnError: string;
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      returnError = `客户端或网络错误: ${error.error.message}`;
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      returnError = `[${error.status}]${
        error.statusText ? '(' + error.statusText + ')' : ''
      }服务器端报错, 错误信息: ${error.error}`;
    }

    if (this.hookMap.errorHandler) {
      const handlerReturn = this.hookMap.errorHandler(
        new HttpApiError(returnError)
      );
      // 若ErrorHandler已有抛出错误，则使用之
      if (handlerReturn instanceof Observable) {
        return handlerReturn;
        // 若返回false，则表示终止后续错误抛出
      } else if (handlerReturn === false) {
        return empty();
      }
    }
    return throwError(returnError); // 继续抛出默认错误
  }

  private _loadCsrfToken() {
    return this._http
      .get('/csrf-assemble.js?' + 't=' + new Date().getTime(), {
        responseType: 'text'
      })
      .pipe(
        map((result: string) => {
          const matches = result.match(/content="(.*?)"/);
          this.csrfToken = (matches && matches[1]) || null;
          return this.csrfToken;
        })
      );
  }
}
