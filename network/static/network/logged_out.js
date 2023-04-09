document.addEventListener('DOMContentLoaded', function() {

    //maps users with a color
    var dict = new Object();

    // colors for each user
    var bgcolors = [
        'antiquewhite' ,'aqua' ,'aquamarine' ,'beige' ,'bisque' ,
        'blanchedalmond' ,'burlywood' ,'chartreuse' ,'coral' ,'cornsilk' ,'cyan' ,
        'gainsboro' ,'ghostwhite' , 'gold' ,'greenyellow' ,'honeydew' ,
        'ivory' ,'khaki' ,'lavender' ,'lavenderblush' ,'lawngreen' ,'lemonchiffon' ,
        'lightgoldenrodyellow' ,'lightgray' ,
        'lightgreen' ,'lightpink' ,'lightsalmon','lightyellow' ,
        'mistyrose', 'navajowhite' ,'oldlace',
        'palegoldenrod' ,'palegreen' ,'paleturquoise' ,'papayawhip' ,
        'peachpuff' ,'peru' ,'pink' ,'plum' ,'sandybrown' ,'seashell','silver',
        'springgreen' ,'tan' ,'thistle' ,'turquoise' ,'wheat' ,'yellow' ,'yellowgreen'
    ]

    document.querySelectorAll('.card').forEach((postNode, index) => {
        const cardtypes = [       
            "card-top",
            "card-right",
            "card-left",
            "card-bottom"
        ];

        const flow = [
            "reverse",
            ""
        ]

        const chars = postNode.children.item(1).children.item(2).innerText.length

        if (chars < 80) {
            postNode.className = postNode.className + ' ' + cardtypes[Math.floor(Math.random() < 0.5)];           
        }
        else if (chars < 210) {
            postNode.className = postNode.className + ' ' + cardtypes[2] + ' ' + flow[Math.floor(Math.random() < 0.5)];
        }
        else {
            postNode.className = postNode.className + ' ' + cardtypes[3];
        }
        
        const username = postNode.children.item(1).children.item(1).innerText;
        const imagen = postNode.children.item(0).children.item(0);

        // assign random color to a username
        if (!dict[username]) {
            let color = bgcolors[Math.floor(Math.random() * bgcolors.length)]
            dict[username] = color;
            bgcolors.splice(bgcolors.indexOf(color), 1);
        }

        imagen.style.backgroundColor = dict[username];

        let prob = Math.floor(Math.random() < 0.22);
        if (prob == 1) {
            let div = document.createElement('div');
            
            div.className = "border-0 shadow-none filter";
            //div.style = `background-color: lightgrey`;
            //div.style = `background-color: ${bgcolors[Math.floor(Math.random() * bgcolors.length)]};`
            postNode.insertAdjacentElement('afterend', div)
        } 
    });

    document.querySelectorAll('.btn-like').forEach((postNode) => {
        link(postNode);
    });
});

function link(postNode) {
    postNode.addEventListener('click', redirect)
    
    function redirect(event) {  
        event.preventDefault();
        window.location.replace("/login");
    };
}

function profile(userId) {
    fetch(`/profile/${userId}`)
    .then(async(response) => {
        if (response.status === 200) {
            return response.json()
        } else {
            let response_body = await response.json();
            throw new Error(response_body.error);                        
        }
    })
    .then(data => {
        document.getElementById("profile-pic").src = data.profile.pic;
        document.getElementById("profile-user").innerText = data.profile.user;
        document.getElementById("profile-followers").innerText = data.profile.followers;
        document.getElementById("profile-following").innerText = data.profile.following;
        document.getElementById("profile-posts").innerText = data.profile.posts;
        document.getElementById("profile-about").innerHTML = data.profile.about;

        let follow_btn = document.getElementById("btn-follow");
    })
    .catch(error => alert(error));
}