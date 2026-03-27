package Chat.app.domain;

import jakarta.validation.constraints.NotBlank;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;


@Document(collection = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class User {
    @Id
    private String id;
    @NotBlank(message = "Username not be blank !")
    private String username;
    @NotBlank(message = "Password not be blank !")
    private String password;
    private String avatar;
}
