
const Follow = require('../models/follow');

const followUserIds = async(identityUserId) => {
    
    const following = await Follow.find({'user': identityUserId})
                                .select({'_id': 0, '__v': 0, 'user': 0});
    
    const followingClean = [];
    following.forEach(follow => {
        followingClean.push(follow.followed)
    });

    const followers = await Follow.find({'followed': identityUserId})
                                    .select({'_id': 0, '__v': 0, 'followed': 0});
    const followersClean = [];
    followers.forEach(follow => {
        followersClean.push(follow.user)
    });
    
    return {
        following: followingClean,
        followers:followersClean
    }
}

const followThisUser = async(identityUserId, profileUserId) => {
    const following = await Follow.findOne({'user': identityUserId, 'followed': profileUserId});

    const follower = await Follow.findOne({'user': profileUserId, 'followed': identityUserId});

    return {
        following,
        follower
    }
}

module.exports = {
    followUserIds,
    followThisUser
}