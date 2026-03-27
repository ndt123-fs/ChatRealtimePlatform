package Chat.app.Config;

import java.io.IOException;
import java.util.Optional;
import Chat.app.response.RestResponse;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.oauth2.server.resource.web.BearerTokenAuthenticationEntryPoint;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
@Component("customAuthenticationEntryPoint")
public class CustomAuthenticationEntryPoint implements AuthenticationEntryPoint {

    private final AuthenticationEntryPoint delegate = new BearerTokenAuthenticationEntryPoint();

    private final tools.jackson.databind.ObjectMapper mapper;

    public CustomAuthenticationEntryPoint(tools.jackson.databind.ObjectMapper mapper) {
        this.mapper = mapper;
    }

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response,
                         AuthenticationException authException) throws IOException, ServletException {

        // mac dinh cua spring
        this.delegate.commence(request, response, authException);
        response.setContentType("application/json;charset=UTF-8");
        RestResponse<Object> res = new RestResponse<>();
        res.setStatusCode(HttpStatus.BAD_REQUEST.value());
        String errorMessage = Optional.ofNullable(authException.getCause()).map(Throwable::getMessage)
                .orElse(authException.getMessage());
        res.setError(errorMessage);
        res.setMessage("Token khong hop le ( het han, khong dung dinh dang) !!");
        mapper.writeValue(response.getWriter(), res);

    }


}
