# Generated by Django 4.1.2 on 2022-12-01 10:05

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('network', '0002_remove_profile_city_remove_profile_name_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='profile',
            name='about',
            field=models.TextField(blank=True, default='About you...', max_length=100),
        ),
    ]