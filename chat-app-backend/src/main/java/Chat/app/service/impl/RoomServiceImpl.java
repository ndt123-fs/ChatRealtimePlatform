package Chat.app.service.impl;

import Chat.app.domain.Message;
import Chat.app.domain.Room;
import Chat.app.errors.IdInvalidException;
import Chat.app.repository.RoomRepository;
import Chat.app.service.RoomService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class RoomServiceImpl implements RoomService {

    private final RoomRepository roomRepository;

    public RoomServiceImpl(RoomRepository roomRepository) {
        this.roomRepository = roomRepository;
    }

    @Override
    public Room createRoom(String roomId) throws IdInvalidException {
        Optional<Room> roomDb = this.roomRepository.findByRoomId(roomId);
        if (roomDb.isPresent()) {
            throw new IdInvalidException("Room already exist !");
        }
        ;
        // create new room
        Room room = new Room();
        room.setRoomId(roomId);
//        System.out.println(roomRepository.findAll());
        return this.roomRepository.save(room);

    }

    @Override
    public Room getRoomByRoomId(String roomId) throws  IdInvalidException {
        Optional<Room> roomDb = this.roomRepository.findByRoomId(roomId);
        if(roomDb.isEmpty()){
            throw new IdInvalidException("Room not found !! ");
        } else return roomDb.get();
    }

    @Override
    public List<Message> getMessage(String roomId, int page, int size) throws IdInvalidException {
        Optional<Room> roomDb = this.roomRepository.findByRoomId(roomId);
        if(roomDb.isEmpty()){
            throw new IdInvalidException("Room not found, so do not get message !");
        }
        //
        List<Message> messages = roomDb.get().getMessages();
        int start = Math.max(0,messages.size() - (page + 1 ) * size );
        int end = Math.min(messages.size(),start + size);

        return messages.subList(start,end);
    }

}
