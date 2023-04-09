from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    pass

class Profile(models.Model):
    user = models.OneToOneField(User, primary_key=True, on_delete=models.CASCADE, related_name='profile')   
    pic = models.ImageField(upload_to='pics', blank=True, null=True)
    about = models.TextField(max_length=281, blank=True, default='About you...')
    followers = models.ManyToManyField(User, blank=True, null=True, related_name='following')

    def __str__(self):
        return self.user.username

    def serialize(self):
        return (
            {
            'user':self.user.username,
            'pic':self.picurl,
            'about':self.about,
            'followers':self.get_followers,
            'following':self.get_following,
            'posts':self.get_posted
            }
        )

    User.get_profile = property(lambda u: Profile.objects.get_or_create(user=u)[0])

    @property
    def get_followers(self):
        return self.followers.count()

    @property
    def get_following(self):
        return self.user.following.count()
    
    @property
    def get_posted(self):
        return self.posted.all().count()

    @property
    def picurl(self):
        if self.pic:
            return self.pic.url
        else:
            return '/media/pics/default.png'

class Post(models.Model):
    by=models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='posted')
    content=models.CharField(max_length=281, blank=False)
    date=models.DateTimeField(auto_now_add=True, null=False, blank=True, verbose_name='posted on')
    likes=models.ManyToManyField(User, blank=True, null=True, related_name='liked')

    def __str__(self):
        return f"Post {self.id} by {self.by.user.username} on {self.date.strftime('%d %b %Y %H:%M:%S')}"

    @property
    def get_likes(self):
        if self.likes.all().count()>0:
            return self.likes.all().count()
        else:
            return '0'