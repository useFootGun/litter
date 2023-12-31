import {initMongoose} from "../../lib/mongoose";
import Post from "../../models/Post";
import Like from "@/models/Like";
import User from "@/models/User";
import Follower from "@/models/Follower";
import {getServerSession} from "next-auth";
import {authOptions} from "./auth/[...nextauth]";

export default async function handler(req, res) {
    await initMongoose();
    const session = await getServerSession(req,res,authOptions);

    if (req.method === 'GET') {
        const {id} = req.query;
        if (id) {
            const post = await Post.findById(id)
                .populate('author')
                .populate({
                    path: 'parent',
                    populate: 'author',
                });
            let postLikedByUser
            if (session) {
                postLikedByUser = await Like.find({
                    author:session.user.id,
                    post:post._id,
                });
            }
            let idLikedByUser = postLikedByUser.map(like => like.post);
            return res.json({post, idLikedByUser})
        } else {
            const parent = req.query.parent || null;
            const author = req.query.author;
            let searchFilter;
            if (!author && !parent) {
                const myFollows = await Follower.find({source:session.user.id}).exec();
                const idsOfPeopleIFollow = myFollows.map(f => f.destination);
                searchFilter = {author:[...idsOfPeopleIFollow,session.user.id]};
            };
            if (author) {
                searchFilter = {author};
            };
            if (parent) {
                searchFilter = {parent};
            };
            const posts = await Post.find(searchFilter)
                .populate('author')
                .populate({
                    path: 'parent',
                    populate: 'author',
                })
                .sort({createdAt: -1})
                .limit(20)
                .exec();
            let postsLikedByUser = [];
            if (session) {
                postsLikedByUser = await Like.find({
                author:session.user.id,
                post:posts.map(p => p._id),
                });
            }
            let idsLikedByUser = postsLikedByUser.map(like => like.post);
            return res.json({
                posts,
                idsLikedByUser
            })
        }
    }

    if (req.method === 'POST') {
        const {text, parent, images} = req.body;
        const post = await Post.create({
          author:session.user.id,
          text,
          parent,
          images
        });
        if (parent) {
            const parentPost = await Post.findById(parent);
            parentPost.commentsCount = await Post.countDocuments({parent});
            await parentPost.save();
        };
        const usersPosts = await Post.find({author:post.author});
        const user = await User.findById(post.author);
        user.postCount = usersPosts.length;
        await user.save(); 
        return res.json(post);
    }
}
