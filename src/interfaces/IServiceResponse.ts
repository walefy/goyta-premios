import { HttpStatusCode } from '../enums/HttpStatusCode';

export interface IServiceResponse<T> {
  status: HttpStatusCode;
  data: T;
}
