package Chat.app.service.impl;


import Chat.app.domain.User;
import Chat.app.errors.IdInvalidException;
import Chat.app.service.UserService;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Component;

import java.util.Collections;

@Component("userDetailsService")
public class UserDetailCustom implements UserDetailsService {
    private final UserService userService;

    public UserDetailCustom(UserService userService) {
        this.userService = userService;
    }

    @Override
    public UserDetails loadUserByUsername(String username)
            throws UsernameNotFoundException {

        User user = null;
        try {
            user = this.userService.handleGetUserByUserName(username);
        } catch (IdInvalidException e) {
            throw new UsernameNotFoundException("User not found");
        }

        if (user == null) {
            throw new UsernameNotFoundException("User not found");
        }
//        System.out.println("Username: " + user.getUsername());
//        System.out.println("Password DB: " + user.getPassword());
        return new org.springframework.security.core.userdetails.User(
                user.getUsername(),
                user.getPassword(),
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER"))
        );
    }
}
