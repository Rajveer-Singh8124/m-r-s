const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs/promises")
const ejs = require("ejs");

const app = express();

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }))
app.set("view engine", "ejs")

async function fetchData() {
    const jsonData = await fs.readFile("data.json", "utf-8");
    const parsedData = JSON.parse(jsonData)

    var movie_list = []
    const length = Object.keys(parsedData["title"]).length

    for (let movie_name = 0; movie_name <= length - 1; movie_name++) {
        movie_list.push(parsedData["title"][movie_name])
    }

    return movie_list;
}



async function fetchMovie(movieTitle) {
    const data = await fetchData();
    movieTitle = movieTitle.toUpperCase();

    const similarityData = await fs.readFile("similarity.json", "utf-8");
    const parsedSimilarityData = JSON.parse(similarityData);




    var movieIndex = -1;


    for (let i = 0; i <= data.length - 1; i++) {

        if (movieTitle == data[i]) {
            console.log("match found " + movieTitle + " " + i);
            movieIndex = i;
            break
        }

    }

    // console.log(parsedSimilarityData[movieIndex]);
    const recommendedMovies =[]

    if (movieIndex !== -1) {
        const similarity = parsedSimilarityData[movieIndex]
        const similarityList = similarity.map((value, index) => [value, index]);
        similarityList.sort((a, b) => b[0] - a[0])


        for (let i = 0; i < 5; i++) {
            let idx = similarityList[i][1]
            recommendedMovies.push(data[idx])
             
        }
    }


    return recommendedMovies;
}


app.get("/", async (req, res) => {

    const title = await fetchData()

    res.render("index", { title: title ,recommendedMovies:[]});
})

app.post("/", async (req, res) => {
    const movieTitle = req.body.movieTitle;
    const title = await fetchData()
    const recommendedMovies = await fetchMovie(movieTitle);

    res.render("index", { title: title ,recommendedMovies:recommendedMovies});
})

app.listen(3000, () => {
    console.log("http://localhost:3000");
})



