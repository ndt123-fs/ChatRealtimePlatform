package Chat.app.service;

import Chat.app.domain.Message;
import Chat.app.domain.Room;
import Chat.app.errors.IdInvalidException;

import java.util.List;

public interface RoomService {
    Room createRoom(String roomId) throws IdInvalidException;

    Room getRoomByRoomId(String roomId) throws IdInvalidException;

    List<Message> getMessage(String roomId, int page , int size)  throws IdInvalidException;
}
