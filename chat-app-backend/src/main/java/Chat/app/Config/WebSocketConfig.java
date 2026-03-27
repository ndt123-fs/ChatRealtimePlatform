    package Chat.app.Config;

    import org.springframework.beans.factory.annotation.Autowired;
    import org.springframework.context.annotation.Configuration;
    import org.springframework.messaging.simp.config.ChannelRegistration;
    import org.springframework.messaging.simp.config.MessageBrokerRegistry;
    import org.springframework.web.bind.annotation.CrossOrigin;
    import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
    import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
    import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

    @EnableWebSocketMessageBroker
   @Configuration
    public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
        @Autowired
        private  JwtChannelInterceptor jwtChannelInterceptor;
        @Override
        public void configureClientInboundChannel(ChannelRegistration registration) {
            registration.interceptors(jwtChannelInterceptor);
        }
        @Override
        public void registerStompEndpoints(StompEndpointRegistry registry) {
            registry.addEndpoint("/chat") // endpoit nay la cho client connect toi websocker : http://localhost:8080/chat
                    .setAllowedOriginPatterns(
                            "*"
                    )
//                    .addInterceptors(authHandShakeInterceptor)
                    .withSockJS();
        }
        @Override
        public void configureMessageBroker(MessageBrokerRegistry registry) {
            registry.enableSimpleBroker("/topic","/queue");
            //client co the gui :/topic/messages, /topic/..., neu chu de duoc truyen trong tien do "/topic/.." thi se auto nhan
            registry.setApplicationDestinationPrefixes("/app");
            registry.setUserDestinationPrefix("/user");
        }
    }
