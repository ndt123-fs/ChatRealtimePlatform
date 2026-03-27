package Chat.app.service.impl;

import Chat.app.domain.User;
import Chat.app.errors.IdInvalidException;
import Chat.app.repository.UserRepository;
import Chat.app.service.UserService;
import org.springframework.data.annotation.Id;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;
    public PasswordEncoder passwordEncoder;
    public UserServiceImpl(UserRepository
                            userRepository,PasswordEncoder passwordEncoder){
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;

    }
    @Override
    public User handleCreateUser(User userRq) throws IdInvalidException{
        Optional<User> userCheck = this.userRepository.findByUsername(userRq.getUsername());
        if(userCheck.isPresent()){
            throw  new IdInvalidException("The user already exists, please enter a different user. !");
        }
        String hashPassword = this.passwordEncoder.encode(userRq.getPassword());
        userRq.setPassword(hashPassword);
        return this.userRepository.save(userRq);

    }

    @Override
    public User handleGetUserById(String idUser) throws IdInvalidException {
        Optional<User> userCheck = this.userRepository.findById(idUser);
        if(userCheck.isEmpty()){
            throw new IdInvalidException("User not exist !,please enter a new user");
        }
        return userCheck.get();

    }
    @Override
    public User handleGetUserByUserName(String username) throws IdInvalidException {
        Optional<User> userCheck = this.userRepository.findByUsername(username);
        if(userCheck.isEmpty()){
            throw new IdInvalidException("User not exist !,please enter a new user");
        }
        return userCheck.get();

    }

}
