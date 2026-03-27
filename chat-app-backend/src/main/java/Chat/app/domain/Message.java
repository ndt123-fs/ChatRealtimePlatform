package Chat.app.domain;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor // constructor all tham so
@NoArgsConstructor // constructor khong tham so
public class Message {
    private String sender;
    private String content;
//    private String type;
    private LocalDateTime timeStamp;

    public Message(String sender ,String content){
        this.sender = sender;
        this.content = content;
        this.timeStamp = LocalDateTime.now();
    }
}
