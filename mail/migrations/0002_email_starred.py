# Generated by Django 3.1.4 on 2021-05-27 07:03

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('mail', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='email',
            name='starred',
            field=models.BooleanField(default=False),
        ),
    ]
