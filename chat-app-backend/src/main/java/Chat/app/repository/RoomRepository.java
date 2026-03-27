package Chat.app.repository;

import Chat.app.domain.Room;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
@Repository
public interface RoomRepository  extends MongoRepository<Room,String> {

    Optional<Room> findByRoomId(String roomId);
}
