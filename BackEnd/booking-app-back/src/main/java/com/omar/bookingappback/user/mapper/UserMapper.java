package com.omar.bookingappback.user.mapper;


import com.omar.bookingappback.user.entity.Authority;
import com.omar.bookingappback.user.User;
import com.omar.bookingappback.user.dto.ReadUserDTO;
import org.mapstruct.Mapper;

@Mapper
public interface UserMapper {

    ReadUserDTO readUserDTOToUser(User user);

    default String mapAuthoritiesToString(Authority authority) {
        return authority.getName();
    }
}
