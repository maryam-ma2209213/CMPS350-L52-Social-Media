import statsRepo from "@/repos/statsRepo";

export default async function StatsPage(){
    const totalUsers = await statsRepo.totalUsers();
    const totalPosts = await statsRepo.totalPosts();
    const totalComments = await statsRepo.totalComments();
    const averageFollowers = await statsRepo.averageFollowers();
    const activeUser = await statsRepo.mostActiveUser();
    const likedPost = await statsRepo.mostLikedPost();
    return(
        <main style={{ marginLeft: 70, padding: "2rem" }}>
        <h1>CAMDEE stats</h1>
        <div className="dashboard-grid">
            <div className="feed-card">
                <h2>Total Users</h2>
                <p>{totalUsers}</p>
            </div>
            <div className="feed-card">
                <h2>Total Posts</h2>
                <p>{totalPosts}</p>
            </div>
            <div className="feed-card">
                <h2>Total Comments</h2>
                <p>{totalComments}</p>
            </div>
            <div className="feed-card">
                <h2>Average Followers</h2>
                <p>{averageFollowers}</p>
            </div>
            <div className="feed-card">
                <h2>Most Active User</h2>
                <p>{activeUser?.username} - {activeUser?.posts} Posts</p>
            </div>
            <div className="feed-card">
                <h2>Most Liked Post</h2>
                <p>By {likedPost?.author} - {likedPost?.likes} Likes</p>
            </div>
        </div>
        </main>
    )
}
