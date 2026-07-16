package apperror

var ErrUnauthorized = AppError{
	Code:       "UNAUTHORIZED",
	Message:    "Unauthorized access",
	HTTPStatus: 401,
}

var MethodNotAllowed = AppError{
	Code:       "METHOD_NOT_ALLOWED",
	Message:    "Method not allowed",
	HTTPStatus: 405,
}

var BadRequest = AppError{
	Code:       "BAD_REQUEST",
	Message:    "Bad request",
	HTTPStatus: 400,
}

var NotFound = AppError{
	Code:       "NOT_FOUND",
	Message:    "Resource not found",
	HTTPStatus: 404,
}

var InternalServerError = AppError{
	Code:       "INTERNAL_SERVER_ERROR",
	Message:    "Internal server error",
	HTTPStatus: 500,
}
