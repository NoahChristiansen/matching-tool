# coding: utf-8

__version__='0.0.1'

import logging
logger = logging.getLogger('matcher')

import pandas as pd
import numpy as np

from typing import List, Callable
from sklearn.cluster import DBSCAN

from . import utils ## Any idea about how to improve this?
from . import indexer
from . import contraster


def select_columns(df:pd.DataFrame, keys:list) -> pd.DataFrame:
    """ 
    Reduces the dataframe to the columns selected for matching.
    
    We always expect at least two columns: source and source_id
    """
    
    columns_to_select = ['source', 'source_id', 'row_id']
    if keys:
        columns_to_select = columns_to_select + keys
    
    return df.loc[:,columns_to_select]


def indexing(df:pd.DataFrame, indexer:Callable[[pd.DataFrame], pd.DataFrame]) -> pd.DataFrame:
    """
    Creates a subsets of the data frame using a function. This subset will be 
    formed by the *candidate record pairs*

    `func` is an indexing technique as: *blocking*, *sorted neighbourhood indexing* and *q-grams* or simply *identity*

    See for reference:
      - *Probabilistic record linkage with the Fellegi and Sunter framework*, M.S. Thesis, **Jonathan de Bruin** (2015)
    """
    logger.info(f"Starting indexing using the strategy {indexer.__name__}")

    df = indexer(df)

    logger.info(f"Indexing {indexer.__name__} done")

    return df


def match(df1:pd.DataFrame, df2:pd.DataFrame, contraster:Callable[[pd.DataFrame], pd.DataFrame], keys: List) -> pd.DataFrame:
    """
    """
    logger.info(f"Starting matching process using the strategy {contraster.__name__}")

    df = contraster(df1, df2, keys)

    logger.info(f"Matching {contraster.__name__} done")

    return df


def cluster(
    df:pd.DataFrame,
    eps:float=0.5,
    min_samples:int=1,
    algorithm:str='auto',
    leaf_size:int=30,
    n_jobs:int=1
) -> pd.DataFrame:
    logger.info('Beginning clustering.')
    df = 1 - df
    clusterer = DBSCAN(
        eps=eps,
        min_samples=min_samples,
        metric='precomputed',
        metric_params=None,
        algorithm=algorithm,
        leaf_size=leaf_size,
        p=None,
        n_jobs=n_jobs
    )
    logger.warning(df)
    clusterer.fit(X=df)
    logger.info('Clustering done!')
    logger.warning(clusterer.core_sample_indices_)
    logger.warning(clusterer.labels_)
    return pd.Series(
        index=df.index,
        data=clusterer.labels_
    )


def square_distances(upper_right, df1, df2):
    upper_left = match(
        df1,
        df1.copy(),
        contraster.exact,
        ['source_id']
    ).pivot(index='row_id_left', columns='row_id_right', values='matches')
    lower_right = match(
        df2,
        df2.copy(),
        contraster.exact,
        ['source_id']
    ).pivot(index='row_id_left', columns='row_id_right', values='matches')
    left = pd.concat([upper_left, upper_right.T])
    right = pd.concat([upper_right, lower_right])
    return pd.concat([left, right], axis=1)


def generate_matched_ids(
    distances:pd.DataFrame,
    df1:pd.DataFrame,
    df2:pd.DataFrame,
    clustering_params:dict,
    self_match
) -> tuple:
    logger.info('Generating matched ids.')
    n = len(df1)
    m = len(df2)

    if not self_match:    
        distances = square_distances(distances, df1, df2)

    ids = cluster(
        distances, **clustering_params
    )
    logging.warning(ids)
    logging.warning(ids.head(n))
    logging.warning(ids.tail(m))
    df1['matched_id'] = ids.head(n)
    df2['matched_id'] = ids.tail(m)
    logger.info('Matched ids generated')

    return (df1, df2)


def run(
    df1:pd.DataFrame,
    keys:List,
    indexer:Callable[[pd.DataFrame],
    pd.DataFrame],
    contraster:Callable[[pd.DataFrame],pd.DataFrame],
    clustering_params:dict,
    df2:pd.DataFrame=None
) -> pd.DataFrame:
    
    df1 = utils.generate_row_ids(df1)
    df1['source_id'] = utils.get_source_id(df1)
    if df2 is None:
        df2 = df1.copy()
        self_match = True
    else:
        df2 = utils.generate_row_ids(df2)
        df2['source_id'] = utils.get_source_id(df2)
        self_match = False

    distances =  utils.version(
        match(
            df1=indexing(
                select_columns(df1, keys),
                indexer=indexer
            ),
            df2=indexing(
                select_columns(df2, keys),
                indexer=indexer
            ),
            contraster=contraster,
            keys=keys
        )
    )

    df1, df2 = generate_matched_ids(
        distances=distances.pivot(index='row_id_left', columns='row_id_right', values='matches'),
        df1=df1,
        df2=df2,
        clustering_params=clustering_params,
        self_match=self_match
    )

    return (df1.drop('row_id', axis=1), df2.drop('row_id', axis=1))


if __name__ == "main":
    df = None
    
    keys = None
    indexer = indexer.identity
    contraster = contraster.exact
    
    run(df, keys, indexer, contraster)
