package Chat.app.Config;

import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
@Component

// làm cho trạng thái hoạt động onl/off
public class RoomOnlineStore {

    private final Map<String, Set<String>> roomSessions = new ConcurrentHashMap<>();
    private final Map<String, String> sessionRoomMap = new ConcurrentHashMap<>();
    private final Map<String, String> sessionUserMap = new ConcurrentHashMap<>();

    public void addUser(String roomId, String user, String sessionId) {

        roomSessions
                .computeIfAbsent(roomId, k -> ConcurrentHashMap.newKeySet())
                .add(sessionId);

        sessionRoomMap.put(sessionId, roomId);
        sessionUserMap.put(sessionId, user);
    }
    public String getUserBySession(String sessionId) {
        return sessionUserMap.get(sessionId);
    }
    public String removeBySession(String sessionId) {

        String roomId = sessionRoomMap.remove(sessionId);
        String user = sessionUserMap.remove(sessionId);

        if (roomId != null) {
            Set<String> sessions = roomSessions.get(roomId);
            if (sessions != null) {
                sessions.remove(sessionId);
            }
        }

        return roomId; // 👈 quan trọng để broadcast
    }

    public Set<String> getOnlineUsernames(String roomId) {
        Set<String> sessions = roomSessions.getOrDefault(roomId, Set.of());
        Set<String> usernames = ConcurrentHashMap.newKeySet();
        for (String sessionId : sessions) {
            String user = sessionUserMap.get(sessionId);
            if (user != null) usernames.add(user);
        }
        return usernames;
    }
}
