package Chat.app.response;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@JsonPropertyOrder({"statusCode","error","path","message","data"})
public class RestResponse<T> {
    private int statusCode;
    private String error;
    private String path;
    private Object message;
    private T data;
}
