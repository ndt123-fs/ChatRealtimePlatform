package Chat.app.controller;

import Chat.app.domain.Message;
import Chat.app.domain.Room;
import Chat.app.errors.IdInvalidException;
import Chat.app.service.RoomService;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1")
@CrossOrigin("*")
public class RoomController {
    private final RoomService roomService;


    public RoomController(RoomService roomService) {
        this.roomService = roomService;
    }
    @Autowired
    MongoTemplate mongoTemplate;

    @PostConstruct
    public void checkDb() {
        System.out.println("🔥 DB đang dùng: " + mongoTemplate.getDb().getName());
    }
    // create room
    @PostMapping("/rooms")
    public ResponseEntity<Room> createRoom(@RequestBody Room room) throws IdInvalidException {

        return ResponseEntity.status(HttpStatus.CREATED.value()).body(this.roomService.createRoom(room.getRoomId()));
    }

    //join room
    @GetMapping("/{roomId}")
    public ResponseEntity<Room> getRoom(@PathVariable String roomId) throws IdInvalidException {
        return ResponseEntity.status(HttpStatus.OK.value()).body(this.roomService.getRoomByRoomId(roomId));
    }
    //get message of room
    @GetMapping("/{roomId}/messages")
    public ResponseEntity<List<Message>> getMessages  (
            @PathVariable String roomId,
            @RequestParam(value = "page",defaultValue = "0",required = false) int page,
            @RequestParam(value = "size",defaultValue = "20",required = false) int size) throws IdInvalidException{
        return ResponseEntity.status(HttpStatus.OK.value()).body(this.roomService.getMessage(roomId,page,size));

    }




}
