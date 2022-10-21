# -*- encoding: utf-8 -*-
"""
Copyright (c) 2019 - present AppSeed.us
"""

from django import template
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.template import loader
from django.urls import reverse
import config.settings.base as settings

from django.core.files.base import ContentFile #for file upload

import pandas as pd
import numpy as np
import random

import datetime

import os
from os import path
#to run bash scripts
import subprocess
from subprocess import Popen, PIPE

import string # to genrate random run_id

from PIL import Image


def util_is_number(value):
    if type(value) == int or type(value) == float:
        return value
    else:
        raise Exception("The value you passed ({0}) is not a number.".format(value))


def correct_background(source_img, patch_size, thresh_percent):

    # convert source to numpy
    im = np.array(source_img)


    # get size ready to patching
    img_x = im.shape[0] - (im.shape[0] % patch_size)
    img_y = im.shape[1] - (im.shape[1] % patch_size)

    im = im[:img_x, :img_y]

    for x in range(0, img_x, patch_size):
        for y in range(0, img_y, patch_size):
            # patching and thresholding
            patch = im[x:x + patch_size, y:y + patch_size]

            min_patch = np.min(patch)
            max_patch = np.max(patch)

            one_perc = (max_patch - min_patch) / 100

            thresh = thresh_percent * one_perc

            patch[patch < thresh] = 0

            # assign patch after thresholding
            im[x:x + patch_size, y:y + patch_size] = patch

    output_img = Image.fromarray(im)

    return output_img



def index(request):
    context = {'segment': 'index'}

    html_template = loader.get_template('home/index.html')
    return HttpResponse(html_template.render(context, request))


def index_upload(request):
    if request.method != 'POST':
        return HttpResponseRedirect("/")


    run_id_length = 6
    while True:
        new_run_id = "run_" + ''.join(random.choice(string.ascii_lowercase + string.digits) for _ in range(run_id_length))
        new_run_dir_path = path.join(settings.RUNS_DIR, new_run_id)
        if not path.exists(new_run_dir_path):
           break

    os.makedirs(new_run_dir_path);

    try:
        img_filename = request.FILES['input-img-file']
    except:
        return HttpResponseRedirect("/")


    saving_filename = path.join(settings.RUNS_DIR, new_run_id, "source_img.jpg") #regardless of original extension
    fout = open(saving_filename, 'wb+') #wb+ because chunks

    uploaded_file_content = ContentFile(img_filename.read())

    try:
        # Iterate through the chunks.
        for chunk in uploaded_file_content.chunks():
            fout.write(chunk)
        fout.close()
    except:
        print("Internal Error: Error while uploading files.")
        return HttpResponseRedirect("/")

    return HttpResponseRedirect('/run/' + new_run_id)


#@login_required(login_url="/login/")

def run(request, run_id):

    context = {}

    context["segment"] = run

    if request.POST:
        patch_size = int(request.POST["input-patch-size-range"])
        threshold_percent = int(request.POST["input-threshold-percent-range"])

        # important to avoid browser cash
        presentDate = datetime.datetime.now()
        timestamp = int(datetime.datetime.timestamp(presentDate) * 1000000)

        source_img = Image.open(path.join(settings.RUNS_DIR, run_id, "source_img.jpg")).convert("L")
        output_img = correct_background(source_img, patch_size, threshold_percent)

        if not path.exists(path.join(settings.RUNS_DIR, run_id, "output")):
            os.makedirs(path.join(settings.RUNS_DIR, run_id, "output"))

        output_img_path = path.join(settings.RUNS_DIR, run_id, "output", "output_img_{0}.jpg".format(timestamp))
        output_img_src = output_img_path
        output_img.save(output_img_src)
        context["correction_img_src"] = output_img_path.split("staticfiles/")[1]

    context["source_img_src"] = path.join(settings.RUNS_DIR, run_id, "source_img.jpg").split("staticfiles/")[1]

    #debugging
    #return JsonResponse(context)

    html_template = loader.get_template('home/run.html')
    return HttpResponse(html_template.render(context, request))





#@login_required(login_url="/login/")
def pages(request):
    context = {}
    # All resource paths end in .html.
    # Pick out the html file name from the url. And load that template.
    try:

        load_template = request.path.split('/')[-1]

        if load_template == 'admin':
            return HttpResponseRedirect(reverse('admin:index'))
        context['segment'] = load_template

        html_template = loader.get_template('home/' + load_template)
        return HttpResponse(html_template.render(context, request))

    except template.TemplateDoesNotExist:

        html_template = loader.get_template('home/page-404.html')
        return HttpResponse(html_template.render(context, request))

    except:
        html_template = loader.get_template('home/page-500.html')
        return HttpResponse(html_template.render(context, request))


