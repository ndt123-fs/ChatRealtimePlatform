package Chat.app.Config;


import Chat.app.service.impl.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.apache.logging.log4j.message.SimpleMessage;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.security.Principal;
import java.util.Map;
// làm cho trạng thái hoạt động onl/off
@Component
public class WebSocketEventListener {
    private final RoomOnlineStore roomOnlineStore;
    private final SimpMessagingTemplate messagingTemplate;

    public WebSocketEventListener(RoomOnlineStore roomOnlineStore, SimpMessagingTemplate simpMessagingTemplate) {
        this.roomOnlineStore = roomOnlineStore;
        this.messagingTemplate = simpMessagingTemplate;
    }

    @EventListener
    public void handleDisconnect(SessionDisconnectEvent event) {
        String sessionId = event.getSessionId();

        // ✅ Lấy user trước khi remove
        String user = roomOnlineStore.getUserBySession(sessionId);
        String roomId = roomOnlineStore.removeBySession(sessionId);

        if (roomId != null && user != null) {
            messagingTemplate.convertAndSend(
                    "/topic/room/" + roomId + "/status",
                    (Object) Map.of("user", user, "status", "OFFLINE") // ✅ thêm user
            );
        }
    }
//
//    @EventListener
//    public void handleDisconnect(SessionDisconnectEvent event) {
//
//        String sessionId = event.getSessionId();
//
//        String roomId = roomOnlineStore.removeBySession(sessionId);
//
//        if (roomId != null) {
//            messagingTemplate.convertAndSend(
//                    "/topic/room/" + roomId + "/status",
//                    (Object) Map.of("status", "OFFLINE")
//            );
//        }
//    }
}




