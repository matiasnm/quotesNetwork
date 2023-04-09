from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render, redirect
from django.urls import reverse
from django.core.paginator import Paginator
from django import forms

from .models import User, Profile, Post
from itertools import chain
import json

###############################################################################
### FORMS
###############################################################################
class PicForm(forms.Form):
    picture=forms.ImageField(
        label="",
        required=False,
        widget=forms.FileInput(attrs={
            'id':'pic-form',
            'type':'file'
        })
    )

class PostForm(forms.Form):
    content = forms.CharField(
        label='',
        required=True,
        widget=forms.Textarea(attrs = {
            'id':'edit-form',
            'class':'form-control',
            'style':'word-break:break-all;resize:none;overflow:hidden',
            'rows':8,
            'maxlength':281,       
            'placeholder':'Write a new Post...'
        })
    )

###############################################################################
### UPLOAD PICTURE
###############################################################################
@csrf_exempt #action does not need a csrf token
@login_required(login_url='/login')
def pic(request):
    
    if request.method =="POST":

        if request.user.username == "Guest":
            return JsonResponse({"msg": "Guest user cannot change default profile picture"}, status=201)
    
        try:
            pic = request.FILES.get('pic')
            
        except:
            return JsonResponse({"error":"Error on file upload."}, status=404)

        try:
            profile = request.user.get_profile
            profile.pic = pic
            profile.save()
            return JsonResponse({"src": profile.pic.url}, status=201)
        
        except Profile.DoesNotExist:
            return JsonResponse({"error":"Profile does not exist."}, status=404)
    #return redirect(request.META['HTTP_REFERER'])

###############################################################################
### EDIT POST
###############################################################################
@csrf_exempt #action does not need a csrf token
@login_required(login_url='/login')
def edit(request):
    if request.method =="PUT":
        try:
            data=json.loads(request.body)
            post=Post.objects.get(id=int(data['post']))
        except Post.DoesNotExist:
            return JsonResponse({"error":"Post does not exist."}, status=404)
   
        if post.by.user != request.user:#db check
            return JsonResponse({"error":"User is not the author."}, status=400)
        
        post.content=data['content']
        post.save()
        return JsonResponse({"message":"Post edited successfully."}, status=201)       
    else:
        return JsonResponse({"error":"PUT request required."}, status=400) 

###############################################################################
### LIKE/UNLIKE
###############################################################################
@csrf_exempt #action does not need a csrf token
@login_required(login_url='/login')
def like(request, post_id):

    if request.method != "PUT":
        return JsonResponse({"error":"PUT request required."}, status=400)
    
    try:
        post = Post.objects.get(id=post_id)

    except Post.DoesNotExist:
        return JsonResponse({"error":"Post does not exist."}, status=400)

    try:
        data = json.loads(request.body)

        if data.get("like") is True:
            if request.user not in post.likes.all():#db check
                post.likes.add(request.user)

        elif data.get("like") is False:
            if request.user in post.likes.all():#db check
                post.likes.remove(request.user)

        else:
            return JsonResponse({"error": "Unknown action"}, status=400)
        
        post.save()
        count=post.get_likes
        return JsonResponse({"count":f"{count}"}, status=201)
    
    except:
        return JsonResponse({"error": "Error on DB"}, status=400)

###############################################################################
### FOLLOW/UNFOLLOW
###############################################################################
@csrf_exempt
@login_required(login_url='/login')
def follow(request, id):

    if request.method != "PUT":
        return JsonResponse({"error":"PUT request required."}, status=400)
    
    try:
        profile=Profile.objects.get(pk=id)      
    except Profile.DoesNotExist:
        return JsonResponse({"error": "Profile does not exist"}, status=404)

    data=json.loads(request.body)

    if data['follow']:
        request.user.following.remove(profile)
        request.user.save()
        return JsonResponse({"follow": False}, status=201)
    else:
        request.user.following.add(profile)
        request.user.save()  
        return JsonResponse({"follow": True}, status=201)


###############################################################################
### PROFILE
###############################################################################
@csrf_exempt #action does not need a csrf token
def profile(request, id):

    if request.method =="PUT":
        if request.user is not None:#checks if user is logged in
            data=json.loads(request.body)
            if int(data['id']) != request.user.id:
                return JsonResponse({"error":"User is not the author."}, status=400)
            
            try:
                profile=request.user.get_profile
            except Profile.DoesNotExist:
                return JsonResponse({"error":"Profile does not exist."}, status=404)

            profile.about=data['about']
            profile.save()
            return JsonResponse({"message":"Successful."}, status=201)
        else:
            return render(request, "network/login.html")
    
    try:
        profile=User.objects.get(pk=id).get_profile
    except Profile.DoesNotExist:
        return HttpResponse(status=404)
    
    edit = request.user.id == id
    follow = None
    if not edit:
        follow = False
        for user in profile.followers.all():
            if str(request.user.username) == str(user):
                follow = True

    return JsonResponse({"profile":profile.serialize(),"edit":edit,"follow":follow}, status=200)


###############################################################################
### GET FOLLOWED POSTS
###############################################################################
@login_required(login_url='/login')
def followed(request):  
    #POSTS
    posts=profile.posted.order_by("-date").all()
    posts = list(chain(posts))
    pages=Paginator(posts, 11)
    if request.GET.get('page'):
        page=int(request.GET.get('page'))
    else:
        page=1
    next=pages.page(page).next_page_number() if pages.page(page).has_next() else 'disabled'
    prev=pages.page(page).previous_page_number() if pages.page(page).has_previous() else 'disabled'
    
    return render(request, "network/index.html", {
        'posts':posts,
        'next':next,
        'prev':prev,
        'page':page
    })

###############################################################################
### FOLLOWING
###############################################################################
@login_required(login_url='/login')
def following(request):

    # NEW POST form; if used, will redirect to All Posts page(index view)
    form=PostForm()
    picForm=PicForm()

    #1: ordered by date, 2: filter by following user
    posts=[]
    for post in Post.objects.order_by("-date").all():
        if post.by in request.user.following.all():
            posts.append(post)

    #1: filter by following user, 2: ordered by date
    #posts = [profile.posted.order_by("-date").all() for profile in request.user.following.all()]
    #posts = list(chain(*posts))

    pages=Paginator(posts, 11)
    if request.GET.get('page'):
        page=int(request.GET.get('page'))
    else:
        page=1
    next=pages.page(page).next_page_number() if pages.page(page).has_next() else 'disabled'
    prev=pages.page(page).previous_page_number() if pages.page(page).has_previous() else 'disabled'

    return render(request, "network/index.html", {
        'form':form,
        'picForm':picForm,
        'posts':posts,
        'next':next,
        'prev':prev,
        'page':page
    })

###############################################################################
### INDEX
###############################################################################
def index(request):
    posts=Post.objects.order_by("-date").all()
    form=PostForm()
    picForm=PicForm()

    if request.method == "POST":
        form=PostForm(request.POST)
        if form.is_valid():
            post=Post(
                by=request.user.get_profile,
                content=form.cleaned_data['content']
            )
            post.save()
        return HttpResponseRedirect(reverse("index"))    
    
    pages=Paginator(posts, 11)
    page=int(request.GET.get('page')) if request.GET.get('page') else 1
    next=pages.page(page).next_page_number() if pages.page(page).has_next() else 'disabled'
    prev=pages.page(page).previous_page_number() if pages.page(page).has_previous() else 'disabled'
    return render(request, "network/index.html", {
        'form':form,
        'picForm':picForm,
        'posts':pages.page(page).object_list,
        'next':next,
        'prev':prev,
        'page':page
    })

###############################################################################
### LOGIN
###############################################################################
def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]

        if username == '' or email == '' or password == '' or confirmation == '':
            return render(request, "network/register.html", {
                "message": "Fields cannot be empty."
            })
        
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")