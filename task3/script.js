// Function to fetch a joke from API
async function getJoke() {
  try {
    let response = await fetch("https://v2.jokeapi.dev/joke/Any?type=single");
    let data = await response.json();
    document.getElementById("joke").innerText = data.joke;
  } catch (error) {
    document.getElementById("joke").innerText = "Oops! Could not fetch a joke.";
    console.error(error);
  }
}
