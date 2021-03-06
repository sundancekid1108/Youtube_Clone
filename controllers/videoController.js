/* eslint-disable prettier/prettier */
import routes from "../routes";
import Video from "../models/Video";
import Comment from "../models/Comment";

//홈
export const home = async(req, res) => {
    try {
        const videos = await Video.find({}).sort({ _id: -1 });
        res.render("home", { pageTitle: "Home", videos });
    } catch (error) {
        console.log(error);
        res.render("home", { pageTitle: "Home", videos: [] });
    }
};

//검색
export const search = async(req, res) => {
    const {
        query: { term: searchingBy }
    } = req;
    let videos = [];
    try {
        videos = await Video.find({
            title: { $regex: searchingBy, $options: "i" }
        });
    } catch (error) {
        console.log(error);
    }
    res.render("search", { pageTitle: "Search", searchingBy, videos });
};


//업로드
export const getUpload = (req, res) =>
    res.render("upload", { pageTitle: "Upload" });

export const postUpload = async(req, res) => {
    const {
        body: { title, description },
        file: { path }
    } = req;
    const newVideo = await Video.create({
        fileUrl: path,
        title,
        description,
        creator: req.user.id
    });
    req.user.videos.push(newVideo.id);
    req.user.save();

    res.redirect(routes.videoDetail(newVideo.id));
};

//비디오 세부사항
export const videoDetail = async(req, res) => {
    const {
        params: { id }
    } = req;
    try {
        const video = await Video.findById(id).populate("creator").populate("comments");
        console.log(video);
        res.render("videoDetail", { pageTitle: video.title, video });
    } catch (error) {
        res.redirect(routes.home);
    }
}


//수정
export const getEditVideo = async(req, res) => {
    const {
        params: { id }
    } = req;
    try {
        const video = await Video.findById(id);
        if (video.creator !== req.user.id) {
            throw Error();
        } else {
            res.render("editVideo", { pageTitle: `Edit ${video.title}`, video });
        }
    } catch (error) {
        res.redirect(routes.home);
    }
};

export const postEditVideo = async(req, res) => {
    const {
        params: { id },
        body: { title, description }
    } = req;
    try {
        await Video.findOneAndUpdate({ _id: id }, { title, description });
        res.redirect(routes.videoDetail(id));
    } catch (error) {
        res.redirect(routes.home);
    }
};

//삭제
export const deleteVideo = async(req, res) => {
    const {
        params: { id }
    } = req;

    try {
        const video = await Video.findById(id);
        if (video.creator !== req.user.id) {
            throw Error();
        } else {
            await Video.findOneAndRemove({ _id: id });
        }
    } catch (error) {
        console.log(error);

    }
    res.redirect(routes.home);
};

//video view 등록
export const postRegisterView = async(req, res) => {
    const {
        params: { id }
    } = req;
    try {
        const video = await Video.findById(id);
        video.views += 1;
        video.save();
        res.status(200);
    } catch (error) {
        res.status(400);
    } finally {
        res.end();
    }
};

// 코멘트
export const postAddComment = async(req, res) => {
    const {
        params: { id },
        body: { comment },
        user
    } = req;
    try {
        const video = await Video.findById(id);
        const newComment = await Comment.create({
            text: comment,
            creator: user.id
        });
        console.log(newComment);
        video.comments.push(newComment.id);
        video.save();
    } catch (error) {
        console.log(error);

        res.status(400);


    } finally {
        res.end();
    }
};