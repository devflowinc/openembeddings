import setuptools

setuptools.setup(
    name="openembeddings",
    version="0.1.0",
    author="developer@arguflow",
    author_email="developer@arguflow.gg",
    description="Usage-based pricing to use bge-large-en model privately to create embeddings on your data",
    url="https://github.com/arguflow/openembeddings",
    install_requires=["requests>=2.31.0"],
    packages=setuptools.find_packages(where="src"),
    package_dir={"": "src"},
    classifiers=[
        "Programming Language :: Python :: 3",
        "License :: OSI Approved :: BSD License",
        "Operating System :: OS Independent",
    ],
    python_requires=">=3.7"
)