export class StatusCode {
  static OK = 200;
  static CREATED = 201;
  static BAD_REQUEST = 400;
  static UNAUTHORIZED = 401;
  static FORBIDDEN = 403;
  static NOT_FOUND = 404;
}

export class JWT {
  static ALG = "HS256";
  static SECRET = new TextEncoder().encode("secret");
}



