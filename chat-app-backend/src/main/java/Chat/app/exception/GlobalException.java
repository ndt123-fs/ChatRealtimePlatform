package Chat.app.exception;

import Chat.app.errors.IdInvalidException;
import Chat.app.errors.StorageException;
import Chat.app.response.RestResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

@RestControllerAdvice
public class GlobalException {
    @ExceptionHandler(value = IdInvalidException.class)
    public ResponseEntity<RestResponse<Object>>handleIdInvalidException(IdInvalidException ex , WebRequest request){
        RestResponse<Object> res = new RestResponse<Object>();
        res.setStatusCode(HttpStatus.BAD_REQUEST.value());
        res.setPath(request.getDescription(false).replace("uri=", ""));
        res.setError("Exception occurs....");
        res.setMessage(ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(res);
    }
    @ExceptionHandler(value = { StorageException.class })
    public ResponseEntity<RestResponse<Object>> handleUploadFileException(StorageException ex, WebRequest request) {

        RestResponse<Object> res = new RestResponse<Object>();
        res.setStatusCode(HttpStatus.BAD_REQUEST.value());
        res.setPath(request.getDescription(false).replace("uri=", ""));
        res.setError("Upload file Exception !!!....");
        res.setMessage(ex.getMessage());

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(res);

    }
}
