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


def correct_background(source_img, patch_size, thresh_percent, staining_method=None):

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
            patch[patch < 100] = 0 # create transparent background from very low color intensity pixels regardless of user-set threshold

            # assign patch after thresholding
            im[x:x + patch_size, y:y + patch_size] = patch

    output_img = Image.fromarray(im)

    #converto to RGB
    output_img = output_img.convert('RGB')

    #let's handle different staining methods (colors)
    # Split into 3 channels
    r, g, b = output_img.split()


    if staining_method == "TH":
        # remove Reds
        r = r.point(lambda i: i * 0)
        # keep Greens
        g = g.point(lambda i: i)
        # remove Blues
        b = b.point(lambda i: i * 0)

    elif staining_method == "OTX2":
        # remove Reds
        r = r.point(lambda i: i)
        # keep Greens
        g = g.point(lambda i: i * 0)
        # remove Blues
        b = b.point(lambda i: i * 0)

    # Recombine back to RGB image
    output_img = Image.merge('RGB', (r, g, b))

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
        img_1_filename = request.FILES['input-img-1-file']
        img_2_filename = request.FILES['input-img-2-file']
    except:
        return HttpResponseRedirect("/")

    img_filenames = [
        img_1_filename,
        img_2_filename
    ]

    for i in range(len(img_filenames)):

        img_filename = img_filenames[i]

        if not img_filename:
            continue

        saving_filename = path.join(settings.RUNS_DIR, new_run_id, "source_img_{0}.jpg".format(i + 1)) #regardless of original extension. start from 1, so we have 1 and 2
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

    source_img_1_src = path.join(settings.RUNS_DIR, run_id, "source_img_1.jpg")
    if path.exists(source_img_1_src):
        context["source_img_1_src"] = source_img_1_src.split("staticfiles/")[1]
    context["patch_size_1_default"] = 25
    context["threshold_1_default"] = 50
    context["staining_1_default"] = ""

    source_img_2_src = path.join(settings.RUNS_DIR, run_id, "source_img_2.jpg")
    if path.exists(source_img_2_src):
        context["source_img_2_src"] = source_img_2_src.split("staticfiles/")[1]
    context["patch_size_2_default"] = 25
    context["threshold_2_default"] = 50
    context["staining_2_default"] = ""

    if request.POST:

        print(request.POST)

        # important to avoid browser cash
        presentDate = datetime.datetime.now()
        timestamp = int(datetime.datetime.timestamp(presentDate) * 1000000)

        #img_1
        patch_size_1 = int(request.POST["input-patch-size-range-1"])
        context["patch_size_1_default"] = patch_size_1
        threshold_percent_1 = int(request.POST["input-threshold-percent-range-1"])
        context["threshold_1_default"] = threshold_percent_1
        staining_method_1 = str(request.POST["input-staining-method-txt-1"])
        staining_method_1 = staining_method_1 if staining_method_1 != "" else None
        context["staining_1_default"] = "" if staining_method_1 == None else staining_method_1

        if staining_method_1 != None:
            #correction img_1
            source_img_1 = Image.open(path.join(settings.RUNS_DIR, run_id, "source_img_1.jpg")).convert("L")
            output_img_1 = correct_background(source_img_1, patch_size_1, threshold_percent_1, staining_method_1)

            if not path.exists(path.join(settings.RUNS_DIR, run_id, "output")):
                os.makedirs(path.join(settings.RUNS_DIR, run_id, "output"))

            output_img_1_path = path.join(settings.RUNS_DIR, run_id, "output", "output_img_1_{0}.png".format(timestamp))
            output_img_1_src = output_img_1_path
            output_img_1.save(output_img_1_src, format="png")
            context["correction_img_1_src"] = output_img_1_path.split("staticfiles/")[1]
            context["correction_1_staining"] = staining_method_1

        # img_2
        patch_size_2 = int(request.POST["input-patch-size-range-2"])
        context["patch_size_2_default"] = patch_size_2
        threshold_percent_2 = int(request.POST["input-threshold-percent-range-2"])
        context["threshold_2_default"] = threshold_percent_2
        staining_method_2 = str(request.POST["input-staining-method-txt-2"])
        staining_method_2 = staining_method_2 if staining_method_2 != "" else None
        context["staining_2_default"] = "" if staining_method_2 == None else staining_method_2

        # correction img_2
        source_img_2 = Image.open(path.join(settings.RUNS_DIR, run_id, "source_img_2.jpg")).convert("L")
        output_img_2 = correct_background(source_img_2, patch_size_2, threshold_percent_2, staining_method_2)

        if not path.exists(path.join(settings.RUNS_DIR, run_id, "output")):
            os.makedirs(path.join(settings.RUNS_DIR, run_id, "output"))

        output_img_2_path = path.join(settings.RUNS_DIR, run_id, "output", "output_img_2_{0}.png".format(timestamp))
        output_img_2_src = output_img_2_path
        output_img_2.save(output_img_2_src, format="png")
        context["correction_img_2_src"] = output_img_2_path.split("staticfiles/")[1]
        context["correction_2_staining"] = staining_method_2


        #colocation
        if staining_method_1 and staining_method_2:
            # calculate
            im_colocation = np.zeros((output_img_1.height, output_img_1.width, 3))
            colocation_n_pixels = 0
            img_n_pixels = output_img_1.width * output_img_1.height

            im_output_1 = np.array(output_img_1)
            im_output_2 = np.array(output_img_2)

            for y in range(im_colocation.shape[0]):
                for x in range(im_colocation.shape[1]):

                    if im_output_1[y, x].any() > 0 and im_output_2[y, x].any() > 0:
                        colocation_n_pixels += 1

                    #overlaying
                    for z in range(im_colocation.shape[2]):
                        # overlay pixels according to higher intensity
                        im_colocation[y,x,z] = im_output_1[y,x,z] if im_output_1[y,x,z] > im_output_2[y,x,z] else im_output_2[y,x,z]

            context["colocatoin_percent"] = int((100 * colocation_n_pixels) / img_n_pixels)

            #save overlayed image
            output_img_colocation = Image.fromarray((im_colocation * 225).astype(np.uint8))
            #extension must be .png because of overlaying
            output_img_colocation_path = path.join(settings.RUNS_DIR, run_id, "output", "output_img_collocation_{0}.png".format(timestamp))
            output_img_colocation_src = output_img_colocation_path
            output_img_colocation.save(output_img_colocation_src, format="png")
            context["colocation_img_src"] = output_img_colocation_path.split("staticfiles/")[1]




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


