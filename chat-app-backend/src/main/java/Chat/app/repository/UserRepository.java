package Chat.app.repository;

import Chat.app.domain.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
@Repository
public interface UserRepository  extends MongoRepository<User, String> {
  Optional<User> findByUsername(String name);

}
