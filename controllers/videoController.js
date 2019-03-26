import routes from "../routes";
import Video from "../models/Video";


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
export const search = (req, res) => {
    const {
        query: { term: searchingBy }
    } = req;
    res.render("search", { pageTitle: "Search", searchingBy });
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
        description
    });
    res.redirect(routes.videoDetail(newVideo.id));
};

//비디오 세부사항
export const videoDetail = async(req, res) => {
    const {
        params: { id }
    } = req;
    try {
        const video = await Video.findById(id);
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
        res.render("editVideo", { pageTitle: `Edit ${video.title}`, video });
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
        await Video.findOneAndRemove({ _id: id });
        res.redirect(routes.home);
    } catch (error) {
        console.log(error);

    }
    res.redirect(routes.home);
};