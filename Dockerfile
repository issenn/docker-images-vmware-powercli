# syntax=docker/dockerfile:1

# hadolint ignore=DL3006
FROM python

ARG CACHEBUST

# hadolint ignore=DL3020
ADD ${CACHEBUST} /.git-hashref

SHELL ["/bin/bash", "-eufo", "pipefail", "-c"]

# hadolint ignore=DL3013
RUN pip install --no-cache-dir --upgrade pip \
    && pip --no-cache-dir install \
      "cryptography<44.0.0" \
      "six==1.17.0" \
      "lxml==5.3.0" \
      "psutil==6.1.1" \
      "pyopenssl==25.0.0" \
    && sync

# hadolint ignore=DL3008,SC1091
RUN apt-get update \
    && apt-get install -y --no-install-recommends wget \
    && source /etc/os-release \
    && wget -q "https://packages.microsoft.com/config/debian/$VERSION_ID/packages-microsoft-prod.deb" \
    && dpkg -i packages-microsoft-prod.deb \
    && rm packages-microsoft-prod.deb \
    && apt-get update \
    && apt-get install -y --no-install-recommends powershell-lts \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* \
    && sync

SHELL ["/usr/bin/pwsh", "-c"]

RUN --mount=type=bind,target=/data \
    # Set-PSRepository -Name "PSGallery" -InstallationPolicy Trusted \
    # && Install-Module -Name VMware.PowerCLI \
    cd $(($env:PSModulePath -split [System.IO.Path]::PathSeparator)[0]) \
    && Expand-Archive /data/Modules/VMware-PowerCLI-13.0.0-20829139.zip ./ \
    # && Expand-Archive /data/Modules/VMware-PowerCLI-13.3.0-24145081.zip ./ \
    # && Get-ChildItem * -Recurse | Unblock-File \
    && Get-Module -Name VMware.PowerCLI -ListAvailable \
    && sync

CMD [ "pwsh" ]
