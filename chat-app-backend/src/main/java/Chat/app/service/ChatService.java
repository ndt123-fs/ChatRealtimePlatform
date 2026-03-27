package Chat.app.service;

import Chat.app.domain.Message;
import Chat.app.errors.IdInvalidException;
import Chat.app.payload.MessageRequest;
import org.springframework.stereotype.Service;

@Service
public interface ChatService  {
    Message sendMessage(String roomId, MessageRequest request,String username) throws IdInvalidException;
}
