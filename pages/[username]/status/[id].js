import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import axios from "axios";
import PostContent from "../../../components/PostContent";
import Layout from "../../../components/Layout";
import Link from "next/link";

export default function PostPage() {
    const router = useRouter();
    const {id} = router.query;
    const [post, setPost] = useState();

    useEffect(() => {
        if(!id) {
            return;
        }
        axios.get('/api/posts?id='+id)
            .then(response => {
                setPost(response.data)
            })
    }, [id]);

    return (
        <Layout>
            {post && (
                <div className="">
                    <Link href={'/'}>
                        <div className="flex items-center mb-4 cursor-pointer">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mr-2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                            </svg>
                            <span className="font-bold text-lg">Garbage</span>
                        </div>
                    </Link>
                    <PostContent {...post} big/>
                </div>
            )}
        </Layout>
    )
}