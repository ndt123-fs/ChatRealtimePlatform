package Chat.app.service.impl;

import Chat.app.domain.Message;
import Chat.app.domain.Room;
import Chat.app.errors.IdInvalidException;
import Chat.app.payload.MessageRequest;
import Chat.app.repository.RoomRepository;
import Chat.app.service.ChatService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
@Service
public class ChatServiceImpl implements ChatService {
    private final RoomRepository roomRepository;

    public ChatServiceImpl(RoomRepository roomRepository) {
        this.roomRepository = roomRepository;
    }

    @Override
    public Message sendMessage(String roomId, MessageRequest request,String username) throws IdInvalidException {
        Optional<Room> roomDb = this.roomRepository.findByRoomId(roomId);

        Message message = new Message();
        message.setContent(request.getContent());
        message.setSender(username);
        message.setTimeStamp(LocalDateTime.now());

        if (roomDb.isPresent()) {
            roomDb.get().getMessages().add(message);
            this.roomRepository.save(roomDb.get());
        } else throw new IdInvalidException("Room not found !!!");
        return message;
    }
}
