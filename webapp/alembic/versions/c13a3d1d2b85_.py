"""empty message

Revision ID: c13a3d1d2b85
Revises: b72ffccfc73f
Create Date: 2017-10-11 17:21:14.337715

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'c13a3d1d2b85'
down_revision = 'b72ffccfc73f'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('upload_log',
    sa.Column('id', sa.String(length=255), nullable=False),
    sa.Column('jurisdiction_slug', sa.String(length=255), nullable=True),
    sa.Column('service_provider_slug', sa.String(length=255), nullable=True),
    sa.Column('user_id', sa.Integer(), nullable=True),
    sa.Column('given_filename', sa.String(length=255), nullable=True),
    sa.Column('upload_timestamp', sa.DateTime(), nullable=True),
    sa.Column('num_rows', sa.Integer(), nullable=True),
    sa.Column('file_size', sa.BigInteger(), nullable=True),
    sa.Column('file_hash', sa.String(length=255), nullable=True),
    sa.ForeignKeyConstraint(['user_id'], ['user.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('upload_log')
    # ### end Alembic commands ###
