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
        like(postNode);
    });
});


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

        if (data.follow != null) {
            
            follow_btn.classList.remove('d-none');
            follow_state = data.follow;

            if ( follow_state == true) {
                follow_btn.innerText="Unfolllow";
            } else {
                follow_btn.innerText="Folllow";
            }

            follow_btn.onclick = function () {
                
                fetch(`follow/${userId}`, {
                    method: 'PUT',
                    body: JSON.stringify({
                        'follow': follow_state
                    })
                })
                .then(async(response) => {
                    if (response.status === 201) {
                        return response.json();
                    } else {
                        let response_body = await response.json();
                        throw new Error(response_body.error);                        
                    }
                })
                .then(data2 => {
                    console.log(data2);
                    if (data2.follow == true) {
                        follow_btn.innerText="unfolllow";
                        follow_state = data2.follow
                    } else {
                        follow_btn.innerText="folllow";//counter!
                        follow_state = data2.follow
                    }
                })
                .catch(error => alert(error))
            };
        }

        // removes previous edit pic btn if any
        let editPic = document.getElementById("profile-pic-edit");
        if (editPic) {
            document.getElementById("profile-pic").parentElement.removeChild(editPic);
        }

        if (data.edit === true) {
           
            let editPic = document.createElement('div');
            editPic.className = 'mask-layer';
            editPic.id = 'profile-pic-edit';
            editPic.innerHTML = '<span>[edit]</span></div>';
            editPic.setAttribute('onclick', 'edit_pic()');

            document.getElementById("profile-pic").parentElement.appendChild(editPic);

            editHTML = '<a href="#" id="edit-profile" data-bs-target="#modal-edit-profile" data-bs-toggle="modal" class="link-dark text-decoration-none">[edit]</a>';
            document.getElementById("profile-about").innerHTML = data.profile.about + editHTML;

            const edit_profile = document.getElementById("edit-profile");
            edit_profile.myParam = data.profile.about;
            edit_profile.addEventListener('click', function (event) {
                
                let modal_edit_profile = document.getElementById('modal-edit-profile');
                let textarea = modal_edit_profile.getElementsByTagName('textarea')[0];
                textarea.innerText = event.currentTarget.myParam;

                let save_button = document.getElementById('profile-save-button');

                save_button.addEventListener('click',() => {  
                    fetch(`/profile/${userId}`, {
                        method: 'PUT',
                        body: JSON.stringify({
                            'id': userId,
                            'about': textarea.value
                        })
                    })
                    .then(async(response) => {
                        if (response.status === 201) {
                            return response.json();
                        } else {
                            let response_body = await response.json();
                            throw new Error(response_body.error);                        
                        }
                    })
                    .then(data => {
                        document.getElementById("profile-about").innerHTML = textarea.value;
                        document.getElementById("profile-back-button").click();
                    })
                    .catch(error => alert(error))
                });
            });
        }// fin de edit===true

    })
    .catch(error => alert(error));
}


function edit_pic() {
    let pic_form = document.getElementById("pic-form");
    pic_form.click();

    pic_form.onchange = function() {

        const formData = new FormData()
        formData.append('pic', pic_form.files[0]);

        fetch ('/pic', {
            method: 'POST',
            body: formData
        })
        .then(async(response) => {
            if (response.status === 201) {
                return response.json();
            } else {
                let response_body = await response.json();
                throw new Error(response_body.error);                        
            }
        })
        .then(data => {
            if (data['src']) {
                document.getElementById('profile-pic').src= data['src'];
            } else {
                alert(data['msg']);
            }
        })
        .catch(error => alert(error))
    };
};


function edit(event) {
    event.preventDefault();

    let post_id = event.target.id;
    let post_element = event.target.parentElement.parentElement.getElementsByTagName("p")[0];
    let post_content = post_element.innerText;
  
    let textarea = document.getElementById('modal-edit').getElementsByTagName('textarea')[0];
    let save_button = document.getElementById('save-button');

    textarea.innerText = post_content;

    const myModal = new bootstrap.Modal('#modal-edit', {
        keyboard: false
      })
    myModal.show();

    save_button.addEventListener('click',() => {  
    fetch('/edit', {
        method: 'PUT',
        body: JSON.stringify({
            'post': post_id,
            'content': textarea.value
        })
    })
    .then(async(response) => {
        if (response.status === 201) {
            return response.json();
        } else {
            let response_body = await response.json();
            throw new Error(response_body.error);                        
        }
    })
    .then(data => {
        post_element.innerText = textarea.value;
    })
    .catch(error => alert(error))

    myModal.hide();
    });
}


function like(postNode) {
    postNode.addEventListener('click', update_like)

    function update_like(event) {
        //toggle heart and animation
        event.preventDefault();
        postNode.classList.toggle("active");

        if (postNode.classList.value.includes("active")) {
            postNode.parentNode.parentNode.parentNode.style = 'box-shadow: 0px 0px 10px 1px gold;'
        } else {
            postNode.parentNode.parentNode.parentNode.style = ''
        }
        //fetch PUT and update count on response
        let like_status=postNode.classList.contains("active")?true:false;

        fetch(`/like/${postNode.id.substr(5)}`, {
            method: 'PUT',
            body: JSON.stringify({
                'like': like_status
            })
        })
        .then(async(response) => {
            if (response.status === 201) {
                return response.json()
            } else {
                let response_body = await response.json();
                throw new Error(response_body.error);                        
            }
        })
        .then(data => {
            console.log(data);
            document.getElementById(`like-count-${postNode.id.substr(5)}`).innerHTML=data.count//new amount
        })
        .catch(error => alert(error));
    }
}