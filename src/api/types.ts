export type ApiErrorCode =
  | 'TIMEOUT'
  | 'NETWORK'
  | 'SERVER'
  | 'NOT_FOUND'
  | 'UNAUTHORIZED'
  | 'VALIDATION'
  | 'UNKNOWN';

export class ApiError extends Error {
  public code: ApiErrorCode;
  public status?: number;
  public retryable: boolean;

  constructor(code: ApiErrorCode, message: string, status?: number, retryable: boolean = false) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.retryable = retryable;
  }
}
