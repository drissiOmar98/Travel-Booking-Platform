package com.omar.bookingappback.user.mapper;


import com.omar.bookingappback.user.entity.Authority;
import com.omar.bookingappback.user.dto.ReadUserDTO;
import com.omar.bookingappback.user.entity.User;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UserMapper {

    ReadUserDTO readUserDTOToUser(User user);

    default String mapAuthoritiesToString(Authority authority) {
        return authority.getName();
    }
}
