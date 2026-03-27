package Chat.app.Config;

import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

@Component
public class JwtChannelInterceptor implements ChannelInterceptor {
    private final SecurityConfiguration securityConfiguration;
    public JwtChannelInterceptor(SecurityConfiguration securityConfiguration) {
        this.securityConfiguration = securityConfiguration;
    }
    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor =
                MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        if (StompCommand.CONNECT.equals(accessor.getCommand())) {
            String auth = accessor.getFirstNativeHeader("Authorization");
            if (auth == null || !auth.startsWith("Bearer ")) {
                throw new IllegalArgumentException("Missing token");
            }
            String token = auth.substring(7);
            try {
                Jwt jwt = securityConfiguration.jwtDecoder().decode(token);
                String username = jwt.getSubject();
                accessor.setUser(new UsernamePasswordAuthenticationToken(username, null));
                System.out.println(username);
            } catch (Exception e) {
                throw new IllegalArgumentException("Invalid token");
            }
        }
        return message;
    }
}
