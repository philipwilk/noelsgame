# noelsgame
This is an attempt at task 1 of the Programming Project Tasks in the OCR June 2019 and June 2020 series paper using the MEAN stack. The usage of a stack allows for the frontend and backend to be completely modular of each other (other than any key data that needs to be exchanged either way, such as user credentials).

# Summary of task 1 (from paper)
#### Noel is creating a music quiz game. The game stores a list of song names and their artist (e.g. the band or solo artist name). The player needs to try and guess the song name.
The game is played as follows:
- A random song name and artist are chosen
- The artist and the first letter of each word in the song title are displayed
- If the user guesses the answer correctly the first time, they score 3 points. If the user guesses the answer correctly the second time they, score 1 points. The game repeats.
- The games ends if the player guess the song name incorrectly the second time.
Only authorised players are allowed to play the game.
Where appropriate, input from the user should be validated.

#### Design, develop, test and evaluate a system that:
1. Allows a player to enter their details, which are they authenticated to ensure they are an authorised player.
2. Stores a list of song names and artists in an external file.
3. Selects a song from the file, displaying the artist and the first letter of each word of the song title.
4. Allows the user up to two chances to guess the name of the song, stopping the game if they guess a song incorrectly on the second chance.
5. If the guess is correct, add the player's score depending on the number of guesses.
6. Displays the number of points the player has when the game ends.
7. Stores the name of the player and their score in an external file.
8. Displays the score and player name of the top 5 winning scores from the external file.
