import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import axios from "axios";
import PostContent from "../../../components/PostContent";
import PostForm from "@/components/PostForm";
import Layout from "../../../components/Layout";
import useUserInfo from "@/hooks/useUserInfo";
import TopNavigationLink from "@/components/TopNavigationLink";

export default function PostPage() {
    const router = useRouter();
    const {id} = router.query;
    const [post, setPost] = useState();
    const [postLikedByUser, setPostLikedByUser] = useState();
    const [replies, setReplies] = useState([]);
    const [repliesLikedByUser, setRepliesLikedByUser] = useState([]);
    const {userInfo} = useUserInfo();

    function fetchData() {
        axios.get('/api/posts?id='+id)
            .then(response => {
                setPost(response.data.post);
                console.log(response.data.idLikedByUser);
                setPostLikedByUser(response.data.idLikedByUser)
            })
        axios.get('/api/posts?parent='+id)
            .then(response => {
                setReplies(response.data.posts);
                setRepliesLikedByUser(response.data.idsLikedByUser);
            })
    }

    useEffect(() => {
        if(!id) {
            return;
        }
        fetchData();
    }, [id]);

    return (
        <Layout>
            <TopNavigationLink/>
            <div className="flex flex-col mb-6">
                {!!post?._id && (
                    <div className="ml-4 mr-4">
                        {post.parent && (
                            <div className="relative flex flex-col mb-6 rounded-lg py-2 px-3 border border-litterBorder">
                                <div className="bg-litterLightGray absolute inset-0 rounded-lg opacity-30 pointer-events-none"></div>
                                <PostContent {...post.parent} />
                                <div className="flex flex-col my-3 rounded-lg py-2 px-3 border border-litterLightGray relative bg-litterWhite">
                                    <PostContent {...post} big likedByUser={postLikedByUser.includes(post._id)}/>
                                </div>
                            </div>
                        )}
                        {!post.parent && (
                            <div className="flex flex-col mb-6 rounded-lg py-2 px-3 border border-litterBorder bg-litterWhite">
                                <PostContent {...post} big likedByUser={postLikedByUser.includes(post._id)} />
                            </div>
                        )}
                    </div>
                )}
                {!!userInfo && (
                    <div className="mb-8">
                        <PostForm 
                            onPost={fetchData}
                            parent={id}
                            compact
                        />
                    </div>
                )}
                <div className="">
                    {replies.length > 0 && replies.map(reply => (
                        <div key={reply._id} className="flex flex-col mb-6 mx-4 rounded-lg py-2 px-3 border border-litterBorder bg-litterWhite">
                            <PostContent {...reply} likedByUser={repliesLikedByUser.includes(reply._id)}/>
                        </div>
                    ))}
                </div>
            </div>
        </Layout>
    )
}