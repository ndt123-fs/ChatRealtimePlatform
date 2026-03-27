package Chat.app.controller;

import Chat.app.domain.User;
import Chat.app.errors.IdInvalidException;
import Chat.app.service.UserService;
import jakarta.validation.Valid;
import lombok.Getter;
import lombok.Setter;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RequestMapping("/api/v1")
@RestController

public class UserController {
    private final UserService userService;

    public UserController(UserService userService){
        this.userService = userService;
    }
    @PostMapping("/users")
    public ResponseEntity<User> createUser( @Valid @RequestBody User user) throws IdInvalidException {
        return ResponseEntity.status(HttpStatus.CREATED.value()).body(this.userService.handleCreateUser(user));
    }
    @GetMapping("/users/{id}")
    public ResponseEntity<User> getUserById(@PathVariable("id") String id) throws IdInvalidException {
        return ResponseEntity.status(HttpStatus.CREATED.value()).body(this.userService.handleGetUserById(id));
    }

}
