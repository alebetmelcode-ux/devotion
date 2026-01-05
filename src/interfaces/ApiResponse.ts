export interface ApiResponse<T = any> {
    statusCode: number;
    isExitoso: boolean;
    mensaje: string;
    resultado: T;
  }