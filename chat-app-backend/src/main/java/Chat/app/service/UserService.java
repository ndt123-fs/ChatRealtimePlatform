package Chat.app.service;

import Chat.app.domain.User;
import Chat.app.errors.IdInvalidException;

public interface UserService {
    User handleCreateUser(User userRq) throws IdInvalidException;

    User handleGetUserById(String idUser) throws IdInvalidException;

    User handleGetUserByUserName(String username) throws IdInvalidException;
}
