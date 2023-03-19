#!/bin/bash

# Install pip
curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py
python get-pip.py --user

# Install requirements
python -m pip install --user -r requirements.txt
