from django.urls import path
from django.contrib import admin
from django.conf.urls.static import static
from django.conf import settings
from . import views

urlpatterns = [
    path("admin", admin.site.urls),
    path("", views.index, name="index"),
    path("profile/<int:id>", views.profile, name="profile"),
    path("followed", views.followed, name="followed"),
    path("follow/<int:id>", views.follow, name="follow"),
    path("following", views.following, name="following"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    # API Routes
    path("like/<int:post_id>", views.like, name="like"),
    path("edit", views.edit, name="edit"),
    path("pic", views.pic, name="pic")
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)