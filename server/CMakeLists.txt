cmake_minimum_required(VERSION 3.10)
project(BankServer)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Find required packages
find_package(PostgreSQL QUIET)

# Source files
set(SOURCES
    main.cpp
    db.cpp
)

set(HEADERS
    db.h
)

# Create executable
add_executable(BankServer ${SOURCES} ${HEADERS})

# Add include directories for header-only libraries
target_include_directories(BankServer PRIVATE 
    ${CMAKE_CURRENT_SOURCE_DIR}
    ${PostgreSQL_INCLUDE_DIRS}
    "C:/Users/ChandrasekaranR/cpp_libs"
    "C:/Crow-full/include"
)

# Link PostgreSQL libraries (only if found)
if(PostgreSQL_FOUND)
    target_link_libraries(BankServer PRIVATE
        ${PostgreSQL_LIBRARIES}
    )
    message(STATUS "PostgreSQL found and linked")
else()
    message(STATUS "PostgreSQL not found - skipping database features")
endif()

# Compiler-specific settings
if(MSVC)
    target_compile_options(BankServer PRIVATE /W4 /EHsc)
else()
    target_compile_options(BankServer PRIVATE -Wall -Wextra -Wpedantic)
endif()

message(STATUS "Build configuration:")
message(STATUS "  C++ Standard: 17")
message(STATUS "  PostgreSQL: ${PostgreSQL_FOUND}")
message(STATUS "  Crow include: C:/Crow-full/include")
message(STATUS "  nlohmann/json include: C:/Users/ChandrasekaranR/cpp_libs")
# Platform-specific settings
if(WIN32)
    # Windows-specific settings
    target_compile_definitions(BankServer PRIVATE _WIN32_WINNT=0x0601)
endif()

message(STATUS "Build configuration:")
message(STATUS "  - Project: BankServer")
message(STATUS "  - C++ Standard: ${CMAKE_CXX_STANDARD}")
message(STATUS "  - PostgreSQL: ${PostgreSQL_FOUND}")
message(STATUS "  - Build type: ${CMAKE_BUILD_TYPE}")
