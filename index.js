import express from "express";
import { fileURLToPath} from "url";
import { dirname } from "path";
import bodyParser from "body-parser";
import session from "express-session";
import fs from "fs";

const app = express();
const __dirname = dirname(fileURLToPath(import.meta.url));
const port = 3000;

const username = "Howard";
const password = "Howard123";
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

// session middleware
app.use(session({
    secret: "my-key",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
    
}));

app.get("/", (req, res) => {
    if (req.session.authenticated) {
        res.redirect("/index");
    } else {
        res.render(`${__dirname}/views/page/login.ejs`, {
            "page_name": "Login Page"
        }); 
    }
});


app.post("/checkaccount", (req, res) => {
    let inputUsername = req.body.username;
    let inputPassword = req.body.password;
    if (inputPassword === password && inputUsername === username) {
        req.session.authenticated = true;
        res.redirect("/index");
    } else {
        res.redirect("/");
    }
});

function isAuthenticated(req, res, next) {
    // console.log("Session check:", req.session);
    if (req.session.authenticated) {
        return next();
    } else {
        console.log("Not authenticated. Redirecting to /");
        res.redirect("/");
    }
}
app.get("/index", isAuthenticated, (req, res) => {
    const diaryData = JSON.parse(fs.readFileSync(`${__dirname}/public/json/Diary.json`, "utf-8"));
    const pinnedDiary = JSON.parse(fs.readFileSync(`${__dirname}/public/json/Pinned.json`, "utf-8"));
    res.render(`${__dirname}/views/page/index.ejs`, {
        "page_name": "Index page",
        Data_Diary: diaryData,
        pinned_Diary: pinnedDiary 
    })
})

app.get("/read/:diaryID", isAuthenticated, (req, res) => {
    const diaryData = JSON.parse(fs.readFileSync(`${__dirname}/public/json/Diary.json`, "utf-8"));
    const pinnedDiary = JSON.parse(fs.readFileSync(`${__dirname}/public/json/Pinned.json`, "utf-8"));
    const diaryID = req.params.diaryID;
    const selected_Diary = diaryData.find(data => data.id === diaryID);
    if (selected_Diary) {
        res.render(`${__dirname}/views/page/read.ejs`, {
            "page_name": "Read Page",
            Data_read: selected_Diary,
            pinned_Diary: pinnedDiary 
        })
    } else {
        res.status(404).send("Data not found");
    }

})

app.get("/manage", isAuthenticated, (req, res) => {
    const diaryData = JSON.parse(fs.readFileSync(`${__dirname}/public/json/Diary.json`, "utf-8"));
    const pinnedDiary = JSON.parse(fs.readFileSync(`${__dirname}/public/json/Pinned.json`, "utf-8"));
    res.render(`${__dirname}/views/page/manage.ejs`, {
        "page_name": "Manage Diary Page",
        Diary: diaryData,
        pinned_Diary: pinnedDiary
    });
    
})

app.post("/manage/create", isAuthenticated, (req, res) => {
    const diaryData = JSON.parse(fs.readFileSync(`${__dirname}/public/json/Diary.json`, "utf-8"));
    const title = req.body.title;
    const date = req.body.date;
    const desc = req.body.desc;
    const story = req.body.story;
    let HighestID = getHighestID(diaryData)

    let newDiaryData = diaryData;
    newDiaryData.push({
        "id": `${HighestID + 1}`,
        "title": `${title}`,
        "date": `${date}`,
        "description": `${desc}`,
        "story": `${story}`
    });
    try {
        fs.writeFileSync(`${__dirname}/public/json/Diary.json`, JSON.stringify(newDiaryData, null, 2));
        console.log("create new diary success");
        res.redirect("/manage");
        
    } catch (writeErr) {
        console.error("fail: ", writeErr);
        res.status(500).send("server error");
        
    }
});

app.get("/manage/delete/:id", isAuthenticated, (req, res) => {
    const diaryData = JSON.parse(fs.readFileSync(`${__dirname}/public/json/Diary.json`, "utf-8"));
    const diaryID = req.params.id;

    // delete data from Pinned.json if id matches
    const pinnedData = JSON.parse(fs.readFileSync(`${__dirname}/public/json/Pinned.json`, "utf-8"));
    const selected_pinned_diary = pinnedData.find(data => data.id === diaryID);
    if (selected_pinned_diary) {
        let newPinnedData = pinnedData.filter(data => data.id !== diaryID);
        try {
            fs.writeFileSync(`${__dirname}/public/json/Pinned.json`, JSON.stringify(newPinnedData, null, 2));
            console.log("delete pinned success");
            
        } catch (writeErr) {
            console.error("fail deleting pinned data: ", writeErr);
            res.status(500).send("server error");
        }
    }
    

    // delete data from Diary.json
    const selected_Diary = diaryData.find(data => data.id === diaryID);
    if (selected_Diary) {
        let newDiaryData = diaryData.filter(item => item.id !== diaryID);
        try {
            fs.writeFileSync(`${__dirname}/public/json/Diary.json`, JSON.stringify(newDiaryData, null, 2));
            console.log("delete success");
            res.redirect("/manage");

        } catch (writeErr) {
            console.error("fail deleting diary data: ", writeErr);
            res.status(500).send("server error");
        }
    } else {
        res.status(404).send("Data not found");
    }
    
});

app.post("/manage/update", isAuthenticated, (req, res) => {
    const title = req.body.title;
    const date = req.body.date;
    const desc = req.body.desc;
    const story = req.body.story;
    const id = req.body.id;
    // update pinned diary if id match
    const pinnedData = JSON.parse(fs.readFileSync(`${__dirname}/public/json/Pinned.json`, "utf-8"));
    const selected_pinned_diary = pinnedData.find(data => data.id === id);
    if (selected_pinned_diary) {
        let newPinnedData = pinnedData.map(data => {
            if (data.id === id) {
                data.title = title;
                data.date = date;
                data.description = desc;
                data.story = story;

            } 
            return data
        });
        try {
            fs.writeFileSync(`${__dirname}/public/json/Pinned.json`, JSON.stringify(newPinnedData, null, 2));
            console.log("update pinned success");
            
        } catch (writeErr) {
            console.error("fail update pinned data: ", writeErr);
            res.status(500).send("server error");
        }
    }

    // update diary data
    const diaryData = JSON.parse(fs.readFileSync(`${__dirname}/public/json/Diary.json`, "utf-8"));
    const selected_diary_data = diaryData.find(data => data.id === id);
    if (selected_diary_data) {
        let newDiaryData = diaryData.map(data => {
            if (data.id === id) {
                data.title = title;
                data.date = date;
                data.description = desc;
                data.story = story;
            }
            return data
        });
        try {
            fs.writeFileSync(`${__dirname}/public/json/Diary.json`, JSON.stringify(newDiaryData, null, 2));
            console.log("update diary success");
            
        } catch (writeErr) {
            console.error("fail update pinned data: ", writeErr);
            res.status(500).send("server error");
        }
    } else {
        res.status(404).send("not found");
    }

    res.redirect("/manage");
    
});

app.get("/logout", isAuthenticated, (req, res) => { 
    req.session.authenticated = false;
    req.session.destroy();
    res.redirect("/");
})

app.get("/manage/pin/:id", isAuthenticated, (req, res) => {
    const maxPin = 4;
    const pinnedData = JSON.parse(fs.readFileSync(`${__dirname}/public/json/Pinned.json`, "utf-8"));
    const diaryData = JSON.parse(fs.readFileSync(`${__dirname}/public/json/Diary.json`, "utf-8"));
    
    // if pinned is the same as id
    const id = req.params.id;
    const selected_Diary = pinnedData.find(data => data.id === id);
    if (selected_Diary) {
        return res.render(`${__dirname}/views/page/manage.ejs`, {
            Diary: diaryData,
            pinned_Diary: pinnedData,
            page_name: "Manage Diary Page",
            error: "cannot pin the same diary"
        })
    }

    // if full
    if (pinnedData.length >= maxPin) {
        return res.render(`${__dirname}/views/page/manage.ejs`, {
            Diary: diaryData,
            pinned_Diary: pinnedData,
            page_name: "Manage Diary Page",
            error: "pinnedFull"
        })
    }

    // add selected diary to pin
    const selected_diary_to_push = diaryData.find(data => data.id === id);
    if (selected_diary_to_push) {
        let newPinnedData = pinnedData;
        newPinnedData.push(selected_diary_to_push);
        try {
            fs.writeFileSync(`${__dirname}/public/json/Pinned.json`, JSON.stringify(newPinnedData, null, 2));
            console.log("Diary pinned successfully");
            return res.redirect("/manage");
        } catch (writeErr) {
            console.error("Failed to pin diary:", writeErr);
            return res.status(500).send("Server error");
        }
    }
    return res.status(404).send("Diary not found");

});

app.get("/manage/unpin/:id", (req, res) => {
    const id = req.params.id;
    const pinned_Diary = JSON.parse(fs.readFileSync(`${__dirname}/public/json/Pinned.json`, "utf-8"));
    let new_Pinned_diary = pinned_Diary.filter(data => data.id !== id);
    try {
        fs.writeFileSync(`${__dirname}/public/json/Pinned.json`, JSON.stringify(new_Pinned_diary, null, 2));
        console.log("Diary unpinned succesfully");
        return res.redirect("/manage");
    } catch (writeErr) {
        console.error("Failed to unpin diary:", writeErr);
        return res.status(500).send("Server error");
    }

});


app.listen(port, () => {    
    console.log(`Server is running in port ${port}`);
});


function getHighestID(diaryData) {
    if (diaryData.length === 0) return 0;
    return Math.max(...diaryData.map(entry => parseInt(entry.id)));
}